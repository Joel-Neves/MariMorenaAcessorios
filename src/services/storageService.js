import axiosInstance from './api';

export const storageService = {

  async uploadImage(file, productId, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      /*isso é para mostrar o progresso do upload, se a função onUploadProgress for passada como argumento,
      *ela será chamada com o progresso do upload
      */
      onUploadProgress: (progressEvent) => {
        if (!onUploadProgress) return;
        const progress = Math.round((progressEvent.loaded * 300) / progressEvent.total);
        onUploadProgress(progress, progressEvent);
      },
    };
    try {
      const response = await axiosInstance.post(`/products/${productId}/images`, formData, config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erro durante o upload');
      } else {
        throw new Error(error.message || 'Erro de rede durante o upload');
      }
    }
  },
  async getAllImagesByProductId(productId) {
    try {
      const response = await axiosInstance.get(`/products/${productId}/images`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar imagens');
    }
  },
  async getImageById(imageId, productId) {
    try {
      const response = await axiosInstance.get(`/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar imagem');
    }
  },
  async updateImage(imageId, file, productId) {
    const formData = new FormData();
    formData.append('file', file);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    try {
      const response = await axiosInstance.put(`/products/${productId}/images/${imageId}`, formData, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar imagem');
    }
  },
  async deleteImage(imageId, productId) {
    try {
      await axiosInstance.delete(`/products/${productId}/images/${imageId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar imagem');
    }
  }
};
