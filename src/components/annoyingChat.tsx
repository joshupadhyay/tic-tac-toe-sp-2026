import { useState } from "react";
import type { ChatMessage } from "../types";

type ChatProps = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
};

export function Chat({ messages, onSend }: ChatProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  }

  return (
    <div className="flex flex-col h-64 w-64 border border-black">
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="font-bold">Player {msg.player}:</span> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex border-t border-black">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-1 text-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-2 bg-gray-200 hover:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
