/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // rewrites 在前后端分离部署时不需要
  // 前端通过 NEXT_PUBLIC_API_URL 环境变量直接访问远程 Gateway API
};

export default nextConfig;
