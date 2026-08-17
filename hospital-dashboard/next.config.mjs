/** @type {import('next').NextConfig} */
const nextConfig = {
  /* react-leaflet's MapContainer doesn't tolerate Strict Mode's double-invoked
     dev effects — it throws "Map container is being reused by another instance". */
  reactStrictMode: false,
};

export default nextConfig;
