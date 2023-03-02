import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
let socket: any;

interface Message {
  user: string;
  text: string;
}

const Chat = () => {
  const router = useRouter();
  const [name, setName] = useState<string | string[] | undefined>(
    router.query.name
  );
  const [room, setRoom] = useState<string | string[] | undefined>("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT;

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!router.isReady) return;
    setRoom(router.query.room);
    setName(router.query.name);
    socket = io(ENDPOINT!);
    socket.emit("join", { name: router.query.name, room: router.query.room });
    return () => {
      socket.disconnect();
    };
  }, [router.isReady, ENDPOINT, router]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  useEffect(() => {
    if (inputRef.current) inputRef.current.scrollIntoView();
  }, [messages]);
  useEffect(() => {
    if (socket) {
      socket.on("message", (message: any) => {
        console.log("connected");
        setIsLoading(false);
        setMessages([...messages, message]);
      });
    }
  }, [socket, messages]);

  const sendMessage = (e: SyntheticEvent) => {
    e.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };
  return (
    <div className="m-4 flex flex-col h-full">
      <h1 className={" my-4 mx-4 text-3xl"}>{"Room " + room}</h1>
      <div className="flex flex-col mx-4">
        {messages.map((item) => (
          <div className="flex flex-row ">
            <p>{"$" + item.user + ": "}</p>
            <p>{" " + item.text}</p>
          </div>
        ))}
        <div>
          {isLoading && <p>Loading...</p>}
          {!isLoading && (
            <input
              type="text"
              disabled={isLoading}
              className="bg-black blink text-green-400 w-full"
              ref={inputRef}
              placeholder={"Type your message here"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(e);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
