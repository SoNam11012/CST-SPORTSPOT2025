import Image from 'next/image';
import Link from 'next/link';

type Venue = {
  id: number;
  name: string;
  location: string;
  type: string;
  sport: string;
  image: string;
};

type Props = {
  venue: Venue;
};

export default function VenueCard({ venue }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition">
      <div className="relative">
        <Image
          src={venue.image}
          alt={venue.name}
          width={500}
          height={300}
          className="object-cover w-full h-48"
        />
        <span className="absolute top-3 right-3 bg-[#ffc971] text-[#1b4332] px-3 py-1 rounded-full text-sm font-semibold">
          {venue.type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{venue.name}</h3>
        <p className="text-sm text-gray-600"><i className="fas fa-map-marker-alt me-1" /> {venue.location}</p>
        <p className="text-sm text-gray-600"><i className="fas fa-running me-1" /> {venue.sport}</p>
      </div>
      <div className="flex justify-between p-4 pt-0">
        <button className="text-sm border border-[#2c6e49] px-3 py-1 rounded hover:bg-[#2c6e49] hover:text-white">
          View Details
        </button>
        <Link href="/venues">
          <button className="text-sm bg-[#ffc971] text-[#1b4332] px-3 py-1 rounded hover:bg-[#ffb84d]">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
}
