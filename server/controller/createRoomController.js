import Room from "../schema/roomSchema.js";

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const { userId } = req.user;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // create room in DB
    const room = await Room.create({
      name,
      createdBy: userId,
      users: [userId],   
      route: null,
      pins: [],
      status: "active"
    });

    res.status(201).json({
      roomId: room._id,
      name: room.name,
      users: room.users,
      createdBy: room.createdBy
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const { userId } = req.user;

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    // find room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // check if room is active
    if (room.status !== "active") {
      return res.status(400).json({ error: "Room is not active" });
    }


    if (room.users.some(id => id.toString() === userId)) {
  return res.status(200).json({
    roomId: room._id,
    name: room.name,
    users: room.users
  });
}

    // add user
    room.users.push(userId);

    // update last activity
    room.lastActivity = Date.now();

    await room.save();

    res.status(200).json({
      roomId: room._id,
      name: room.name,
      users: room.users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};