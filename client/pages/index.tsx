import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
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
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  const headings = "my-6 mx-4 ";
  const margins = "my-6";
  return (
    <div className={"flex flex-col"}>
      <h1 className={" my-4 mx-4 text-3xl"}>dos.chat</h1>
      <div className={" flex flex-row"}>
        <h3 className={"ml-4 mr-2 " + margins}>
          {"> enter your name (then press enter) : "}
        </h3>
        <input
          type="text"
          className={` bg-black  blink`}
          ref={nameRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              //TODO: check name is not null
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
              if (e.key === "Enter") {
                //TODO: check room not null
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
  );
}
