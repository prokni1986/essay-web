import React from 'react';
import useImageSlider from '@/hooks/useImageSlider';

const images = [
  '/images/image8.jpg',
  '/images/image9.jpg',
  '/images/image7.jpg',
  '/images/image6.jpg',
  '/images/image11.jpg',
];

const HeroSectionWithSlider = () => {
  const { currentImage, handleImageClick } = useImageSlider(0, images);

  return (
    <section className="relative w-full h-[600px] overflow-hidden mb-12 bg-black">
      <img
        src={images[currentImage]}
        alt={`Slide ${currentImage}`}
        className="w-full h-full object-cover transition-opacity duration-500"
      />

      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(index)}
            className={`w-40 h-30 border-2 ${currentImage === index ? 'border-yellow-500' : 'border-white'} rounded-lg overflow-hidden`}
          >
            <img
              src={images[index]}
              alt={`Thumbnail ${index}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Overlay để tránh tràn vào footer */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30 pointer-events-none"></div>
    </section>
  );
};

export default HeroSectionWithSlider;