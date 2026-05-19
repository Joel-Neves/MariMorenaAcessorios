import axiosInstance from './api';

export const storageService = {
  async uploadImagem(file, caminho) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caminho', caminho);
      const response = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Não foi possível fazer upload da imagem');
    }
  },

  async uploadFotoUsuario(file, usuarioId) {
    const timestamp = Date.now();
    const nomeArquivo = `${usuarioId}_${timestamp}_${file.name}`;
    const caminho = `usuarios/${usuarioId}/${nomeArquivo}`;

    const url = await this.uploadImagem(file, caminho);
    return { url, caminho };
  },

  async uploadImagemProduto(file, produtoId) {
    const timestamp = Date.now();
    const nomeArquivo = `${produtoId}_${timestamp}_${file.name}`;
    const caminho = `produtos/${produtoId}/${nomeArquivo}`;

    const url = await this.uploadImagem(file, caminho);
    return { url, caminho };
  },

  async deletarImagem(caminhoCompleto) {
    try {
      await axiosInstance.delete('/upload', { data: { caminho: caminhoCompleto } });
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw new Error('Não foi possível deletar a imagem');
    }
  },

  async getImagemURL(caminho) {
    try {
      const response = await axiosInstance.get('/upload/url', { params: { caminho } });
      return response.url;
    } catch (error) {
      console.error('Erro ao obter URL da imagem:', error);
      throw new Error('Não foi possível obter a URL da imagem');
    }
  }
};
