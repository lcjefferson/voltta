import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon VOLTTA — V dourado em fundo charcoal. */
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            color: "#c4a574",
            letterSpacing: "-0.06em",
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          V
        </div>
      </div>
    ),
    { ...size },
  );
}
