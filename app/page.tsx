import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Image src="/logo.png" alt="Artisan Hub Logo" width={349} height={78} />
      <h1>Welcome to Artisan Hub</h1>
      <p>Your one-stop platform for artisan crafts. The future is this <b>Ship</b>.</p>
    </div>
  );
}
