import React, { useState } from 'react';
import { communityApi } from '../services/api';

interface UseShareExperienceProps {
  type: 'ACTIVITY' | 'TRIP' | 'EXPLORE_ITEM';
  refId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useShareExperience = ({ type, refId, onSuccess, onClose }: UseShareExperienceProps) => {
  const [rating, setRating] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [tip, setTip] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submitShare = async () => {
    setLoading(true);
    try {
      let contentObj;
      if (type === 'ACTIVITY') {
        contentObj = { description, tip };
      } else if (type === 'EXPLORE_ITEM') {
        contentObj = { description, tip, specificLocation };
      } else {
        contentObj = { description, tip: '' };
      }

      const formData = new FormData();
      formData.append('type', type);
      formData.append('refId', refId);
      formData.append('rating', rating.toString());
      formData.append('description', description);
      formData.append('content', JSON.stringify(contentObj));

      if (images.length > 0) {
        images.forEach(file => {
          formData.append('images', file);
        });
      }

      await communityApi.shareContentFormData(formData);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to share:', error);
      const errorMessage = error.response?.data?.message || 'Chia sẻ thất bại, vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    rating,
    setRating,
    description,
    setDescription,
    tip,
    setTip,
    specificLocation,
    setSpecificLocation,
    loading,
    images,
    previews,
    handleImageChange,
    removeImage,
    submitShare
  };
};
