import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const ChatRoom = () => {
  const { user, refreshUnreadMessages } = useUser();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch other user
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then(setOtherUser)
      .catch((err) => console.error("User fetch error:", err));
  }, [userId]);

  // Fetch chat history and mark messages as seen
  useEffect(() => {
    if (!user?.email || !otherUser?.email) return;

    fetch(`http://localhost:5000/api/messages/${user.email}/${otherUser.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          scrollToBottom();
        }
      })
      .catch((err) => console.error("Message fetch error:", err));

    // Mark messages as seen and refresh bell count
    fetch("http://localhost:5000/api/messages/mark-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: user.email,
        otherEmail: otherUser.email,
      }),
    })
      .then(() => refreshUnreadMessages?.())
      .catch((err) => console.error("Seen update error:", err));
  }, [user?.email, otherUser?.email]);

  // Join socket room and listen for messages
  useEffect(() => {
    if (!user?.email) return;

    socket.emit("join", user.email);

    const handleReceive = (msg) => {
      const isRelevant =
        (msg.sender === otherUser?.email && msg.receiver === user.email) ||
        (msg.sender === user.email && msg.receiver === otherUser?.email);

      const isDuplicate = messages.some(
        (m) =>
          m.content === msg.content &&
          m.sender === msg.sender &&
          m.receiver === msg.receiver &&
          new Date(m.createdAt).getTime() === new Date(msg.createdAt).getTime()
      );

      if (isRelevant && !isDuplicate) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [user?.email, otherUser?.email, messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    let msg = {
      sender: user.email,
      receiver: otherUser.email,
      type: "text",
      content: message,
    };

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      msg = {
        sender: user.email,
        receiver: otherUser.email,
        type: "file",
        content: data.url,
      };
    }

    try {
      const saveRes = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      const savedMsg = await saveRes.json();
      socket.emit("sendMessage", savedMsg);
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!user || !otherUser) return <div>Loading chat...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">
        Chat with{" "}
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => navigate(`/user/${otherUser._id}`)}
        >
          {otherUser.name}
        </span>
      </h2>
      <div className="w-full max-w-2xl h-[60vh] overflow-y-auto bg-white p-4 rounded shadow mb-4">
        {messages.map((msg, i) => {
          const isMe = msg.sender === user.email;
          const isText = msg.type === "text";
          const name = isMe ? "You" : otherUser.name;
          const style = isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black";

          return (
            <div key={i} className={`mb-3 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <p className="text-sm text-gray-500 mb-1">{name}</p>
              {isText ? (
                <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${style}`}>
                  {msg.content}
                </div>
              ) : (
                <a
                  href={msg.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-lg max-w-xs break-words underline ${style}`}
                >
                  📎 View File
                </a>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-2xl items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded focus:outline-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;