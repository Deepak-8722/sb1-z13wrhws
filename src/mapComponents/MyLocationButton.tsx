import React from 'react';
import { Crosshair } from 'lucide-react';

interface MyLocationButtonProps {
  userLocation: [number, number] | null;
  onGoToCurrentLocation: () => void;
}

export const MyLocationButton: React.FC<MyLocationButtonProps> = ({
  userLocation,
  onGoToCurrentLocation,
}) => {
  return (
    <button
      onClick={onGoToCurrentLocation}
      disabled={!userLocation}
      className={`fixed top-1/2 right-6 transform -translate-y-1/2 z-[1000] w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
        userLocation
          ? 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-xl'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      title={userLocation ? 'Go to my location' : 'Location not available'}
    >
      <Crosshair className="w-5 h-5 mx-auto" />
    </button>
  );
};