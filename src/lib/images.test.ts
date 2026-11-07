import { describe, expect, it } from "vitest";
import { cloudinaryPublicId, sniffImage } from "@/lib/images";

describe("sniffImage", () => {
  it("recognises JPEG, PNG and WebP by their leading bytes", () => {
    expect(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("jpg");
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("png");
    expect(sniffImage(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1"))).toBe("webp");
  });

  it("rejects other content, whatever it is named", () => {
    expect(sniffImage(Buffer.from("<?php system($_GET['c']); ?>"))).toBeNull();
    expect(sniffImage(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImage(Buffer.alloc(0))).toBeNull();
  });
});

describe("cloudinaryPublicId", () => {
  it("finds the id of photos uploaded to the shop's folder", () => {
    expect(
      cloudinaryPublicId(
        "https://res.cloudinary.com/ler7wnpl/image/upload/v1794033982/bhawani-emporium/evawm9su3dfu7nccevdp.png",
      ),
    ).toBe("bhawani-emporium/evawm9su3dfu7nccevdp");
  });

  it("ignores photos outside that folder and other sites", () => {
    expect(cloudinaryPublicId("https://res.cloudinary.com/x/image/upload/v1/other/abc.jpg")).toBeNull();
    expect(cloudinaryPublicId("/products/ig-CFFAfPBnYGN.jpg")).toBeNull();
    expect(cloudinaryPublicId("https://example.com/bhawani-emporium/abc.jpg")).toBeNull();
  });
});
