import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple Touch Icon VOLTTA. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171715",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 118,
            fontWeight: 700,
            color: "#c4a574",
            letterSpacing: "-0.06em",
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          V
        </div>
      </div>
    ),
    { ...size },
  );
}
