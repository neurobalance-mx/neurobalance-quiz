/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Permite embeber el quiz en el sitio de WordPress mediante iframe.
    const allowed = process.env.ALLOWED_FRAME_ANCESTORS || "*";
    return [{ source: "/((?!admin|api/admin).*)", headers: [{ key: "Content-Security-Policy", value: `frame-ancestors ${allowed}` }] }];
  },
};
export default nextConfig;
