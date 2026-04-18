import Room from "../schema/roomSchema.js";

const roomUsersMap = {};
const roomPinsMap = {};
let routeTimeout = null;

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on("JOIN_ROOM", async ({ roomId, userId, name }) => {
      try {
        if (!roomId || !userId) return;

        socket.join(roomId);
        socket.userId = userId;
        socket.roomId = roomId;

        if (!roomUsersMap[roomId]) roomUsersMap[roomId] = [];

        let user = roomUsersMap[roomId].find((u) => u.id === userId);

        if (!user) {
          user = {
            id: userId,
            name: name || "Anonymous",
            lat: 17.385,
            lng: 78.486,
          };
          roomUsersMap[roomId].push(user);
        } else {
          user.name = name || user.name;
        }


        // LOAD FROM DB
        const dbRoom = await Room.findById(roomId);

        const pins = (dbRoom?.pins || []).map((p) => ({
          id: p._id.toString(),
          lat: p.lat,
          lng: p.lng,
          createdBy: p.createdBy,
        }));

        socket.emit("ROOM_STATE", {
          roomId,
          users: roomUsersMap[roomId],
          pins,
          route: dbRoom?.route || null,
        });

        socket.to(roomId).emit("USER_JOINED", { user, roomId });
      } catch (err) {
        console.error("JOIN_ROOM error:", err);
      }
    });

    // ADD PIN
    socket.on("ADD_PIN", async ({ lat, lng }) => {
      const { roomId, userId } = socket;
      if (!roomId) return;

      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        const newPin = {
          lat,
          lng,
          createdBy: userId,
        };

        room.pins.push(newPin);
        await room.save();

        const savedPin = room.pins[room.pins.length - 1];

        io.to(roomId).emit("PIN_ADDED", {
          id: savedPin._id.toString(),
          lat: savedPin.lat,
          lng: savedPin.lng,
          createdBy: savedPin.createdBy,
        });
      } catch (err) {
        console.error("ADD_PIN error:", err);
      }
    });


    // CLEAR PINS
    socket.on("CLEAR_PINS", async () => {
      const { roomId } = socket;
      if (!roomId) return;

      try {
        await Room.findByIdAndUpdate(roomId, {
          pins: [],
          route: null,
        });

        io.to(roomId).emit("PINS_CLEARED");
      } catch (err) {
        console.error("CLEAR_PINS error:", err);
      }
    });


    // REMOVE PIN
    socket.on("REMOVE_PIN", async ({ pinId }) => {
      const { roomId } = socket;
      if (!roomId) return;

      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.pins = room.pins.filter(
          (p) => p._id.toString() !== pinId
        );

        room.route = null;
        await room.save();

        io.to(roomId).emit("PIN_REMOVED", { pinId });
        io.to(roomId).emit("ROUTE_UPDATED", null);
      } catch (err) {
        console.error("REMOVE_PIN error:", err);
      }
    });


    // GENERATE ROUTE (PINS)
    socket.on("GENERATE_ROUTE", async ({ pins }) => {
      const { roomId } = socket;
      if (!roomId || !pins || pins.length < 2) return;

      try {
        clearTimeout(routeTimeout);

        routeTimeout = setTimeout(async () => {
          const coords = pins
            .map((p) => `${p.lng},${p.lat}`)
            .join(";");

          const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

          const res = await fetch(url);
          const data = await res.json();

          if (!data.routes?.length) return;

          const route = data.routes[0].geometry;

          await Room.findByIdAndUpdate(roomId, {
            route,
          });

          io.to(roomId).emit("ROUTE_UPDATED", {
            coordinates: route.coordinates,
          });
        }, 600);
      } catch (err) {
        console.error("GENERATE_ROUTE error:", err);
      }
    });


    // SET ROUTE (SOURCE → DEST)
    socket.on("SET_ROUTE", async ({ source, destination }) => {
      const { roomId } = socket;
      if (!roomId || !source || !destination) return;

      try {
        const geo = async (place) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
            {
              headers: {
                "User-Agent": "live-map-app",
              },
            }
          );

          const data = await res.json();
          if (!data.length) throw new Error("Location not found");

          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        };

        const src = await geo(source);
        const dest = await geo(destination);

        const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;

        const routeRes = await fetch(url);
        const routeData = await routeRes.json();

        if (!routeData.routes?.length) return;

        const coordinates = routeData.routes[0].geometry.coordinates;

        await Room.findByIdAndUpdate(roomId, {
          route: {
            source,
            destination,
            coordinates,
          },
        });

        io.to(roomId).emit("ROUTE_UPDATED", {
          coordinates,
          source,
          destination,
        });
      } catch (err) {
        console.error("SET_ROUTE error:", err);
      }
    });



    socket.on("SEND_ALERT", ({ message }) => {
  const { roomId } = socket;

  if (!roomId || !message) return;

  io.to(roomId).emit("RECEIVE_ALERT", {
    message,
    sender: socket.userId,
  });
});


    // DISCONNECT
    socket.on("disconnect", () => {
      const { roomId, userId } = socket;
      if (!roomId || !userId) return;

      const room = roomUsersMap[roomId];
      if (!room) return;

      roomUsersMap[roomId] = room.filter((u) => u.id !== userId);

      socket.to(roomId).emit("USER_LEFT", { userId });
    });
  });
};

export default setupSocket;