const users: any = [];

export const addUser = ({ id, name, room }: any) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user: any) => user.room === user.room && user.name === name
  );

  if (existingUser) {
    return { error: "Sorry! This username is taken right now." };
  }

  const user = { id, name, room };

  users.push(user);

  return { user };
};

export const removeUser = (id: any) => {
  const index = users.findIndex((user: any) => user.id === id);

  if (index !== -1) {
    const item = users.splice(index, 1);

    return item;
  }
};

export const getUser = (id: any) => {
  return users.find((user: any) => user.id === id);
};

export const getUsersInRoom = (room: any) => {
  return users.filter((user: any) => user.room === room);
};
