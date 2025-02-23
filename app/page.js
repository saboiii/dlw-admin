'use client'
import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Home() {
  return (
    <div className='flex flex-col w-full h-screen justify-center items-center'>
      <Image
        src='https://res.cloudinary.com/dewzkcqfr/image/upload/v1738143009/sg2_w1zxn4.jpg'
        height={1080}
        quality={100}
        width={1920}
        className='absolute object-cover object-center w-full h-full grayscale blur-sm opacity-20'
        alt='Background'
        placeholder="blur"
        blurDataURL='/images/sglow.jpg'
      />

      <div className="h-full items-center justify-center flex flex-col z-20">
        <Image
        src='/images/logo.png'
        height={400}
        quality={100}
        width={400}
        alt="DLW Logo"
        className="h-16 w-auto md:h-auto"
      />
        <Link href='/dashboard' className="buttonDesign mt-6 items-center justify-center flex flex-row">
        <div>DASHBOARD</div>
        <FiChevronRight size={12} className="ml-2"/>
        </Link>
      </div>

    </div>
  );
}
