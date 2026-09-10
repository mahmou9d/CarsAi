"use client";

import React from "react";

export default function WaitlistPage() {
  return (
    <div className="w-full min-h-screen pt-20">
      <div className="w-full aspect-video max-w-5xl mx-auto">
        <iframe
          className="w-full h-full"
          src="https://carsai.created.app/"
          title="Waitlist"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}