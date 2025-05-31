import { useState, useEffect } from 'react';

const useImageSlider = (initialIndex = 0, images = []) => {
  const [currentImage, setCurrentImage] = useState(initialIndex);

  const handleImageClick = (index) => {
    setCurrentImage(index);
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, [images.length]);

  return {
    currentImage,
    handleImageClick,
  };
};

export default useImageSlider;