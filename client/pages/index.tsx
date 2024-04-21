import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
export default function Home() {
  const { user, isLoading } = useUser();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const [roomEntered, setRoomEntered] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  const [heading1, setHeading1] = useState(false);
  const [heading2, setHeading2] = useState(false);
  const [heading3, setHeading3] = useState(false);
  const renderLoading = async () => {
    setHeading1(true);
    setTimeout(() => setHeading2(true), 2000);
    setTimeout(() => setHeading3(true), 4000);
    setTimeout(() => router.push(`/chat?name=${name}&room=${room}`), 6000);
  };

  const nameRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (nameRef.current && !isLoading && user?.email) {
      nameRef.current.focus();
    } else if (loginRef.current && !isLoading && !user?.email) {
      loginRef.current.focus();
    }
  }, [loginRef, isLoading, user]);

  const headings = "my-6 mx-4 ";
  const margins = "my-6";
  return (
    <div>
      {!isLoading && user?.email && (
        <div className={"flex flex-col"}>
          <div className={"flex flex-row flex-1 justify-between items-center"}>
            <h1 className={" my-4 mx-4 text-3xl"}>dos.chat</h1>
            <Link href="/api/auth/logout" className={"mr-4"}>
              <button>Log out</button>
            </Link>
          </div>
          <div className={" flex flex-row"}>
            <h3 className={"ml-4 mr-2 " + margins}>
              {"> enter your name (then press enter) : "}
            </h3>
            <input
              type="text"
              className={` bg-black  blink`}
              ref={nameRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name !== "") {
                  setNameEntered(true);
                }
              }}
              onChange={(e) => {
                setName(e?.target.value);
              }}
              disabled={disabled}
            />
          </div>
          {nameEntered && (
            <div className={" flex flex-row"}>
              <h3 className={"ml-4 mr-2 " + margins}>
                {"> enter your room (then press enter) :"}
              </h3>
              <input
                type="text"
                className={` bg-black  blink`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && room !== "") {
                    setRoomEntered(true);
                    renderLoading();
                    setDisabled(true);
                  }
                }}
                onChange={(e) => {
                  setRoom(e?.target.value);
                }}
                autoFocus
                disabled={disabled}
              />
            </div>
          )}
          {heading1 && <h1 className={headings}>{"> connecting..."}</h1>}
          {heading2 && (
            <h1 className={headings}>
              {"> coding a visual basic to hack into the mainframe"}
            </h1>
          )}

          {heading3 && (
            <h1 className={headings}>{"> obtaining nuclear passcodes..."}</h1>
          )}
        </div>
      )}

      {!isLoading && !user?.email && (
        <div className={"flex flex-col"}>
          <h1 className="my-4 mx-4 text-3xl">dos.chat</h1>
          <Link
            href="/api/auth/login"
            className={"mx-4 focus:border-none focus:outline-none"}
            ref={loginRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") console.log("yes button pressed");
            }}
          >
            <button className="flex flex-row">
              <p>{"> "}</p> <p className={"underline ml-2"}>login</p>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
