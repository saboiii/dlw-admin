import Link from "next/link";

export default function Home() {
  return (
    <div className='flex flex-col w-full h-screen justify-center items-center'>
      <div className="mb-4 title">DLW ADMIN SITE</div>
      <p className="mb-6">&#40;still in progress, downloads to be added soon :p&#41;</p>
      <Link href='/dashboard' className="buttonDesign">Dashboard</Link>
    </div>
  );
}
