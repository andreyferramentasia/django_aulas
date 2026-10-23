/* =========================================================
   Trilhas da busca: cada tema lista, em ordem, os passos que
   falam dele, com uma nota do que cada passo faz no tema.

   keywords   palavras que ativam a trilha na busca
   highlight  termos marcados dentro dos passos
   steps      [id do passo, nota]; a ordem é a da trilha
   ========================================================= */

export const TOPICS = [
  {
    title: 'Arquivos e media',
    keywords: ['media', 'medias', 'arquivo', 'arquivos', 'upload', 'filefield', 'imagefield', 'pillow'],
    highlight: ['MEDIA_URL', 'MEDIA_ROOT', 'media', 'FileField', 'ImageField', 'upload_to', 'pillow', 'enctype', 'material', 'image', 'imagem', 'arquivos', 'arquivo'],
    steps: [
      ['passo-4', 'Instalar o Pillow, exigido pelo ImageField'],
      ['passo-11', 'A pasta media/ fica fora do Git'],
      ['passo-17', 'Campos material (FileField) e image (ImageField) no model'],
      ['video-10', 'Vídeo: configurar o media'],
      ['passo-media', 'MEDIA_URL, MEDIA_ROOT e a rota que entrega os arquivos'],
      ['extra-detailview', 'Mostrar a imagem e o link do material com .url'],
      ['passo-23', 'Material e imagem entram no formulário'],
      ['passo-25', 'enctype no formulário para enviar arquivos'],
      ['passo-27', 'Manter, trocar ou limpar o arquivo na edição'],
      ['passo-28', 'Os arquivos continuam em media/ depois de excluir'],
    ],
  },
  {
    title: 'ListView, a lista',
    keywords: ['listview', 'lista', 'listar', 'read'],
    highlight: ['ListView', 'course_list', 'listar', 'paginate_by', 'context_object_name', 'is_paginated', 'page_obj'],
    steps: [
      ['video-11', 'Vídeo: o caminho de uma requisição'],
      ['fluxo-requisicao', 'O caminho da lista: url, view, model e template'],
      ['video-13', 'Vídeo: ListView e rotas'],
      ['passo-21', 'A ListView, a rota listar/ e o include no projeto'],
      ['video-14', 'Vídeo: o template da lista'],
      ['passo-22', 'O template course_list.html e a paginação'],
      ['passo-34', 'Exigir login e a permissão view_course'],
    ],
  },
  {
    title: 'DetailView, ver um curso',
    keywords: ['detailview', 'detalhe', 'detalhes', 'ver'],
    highlight: ['DetailView', 'course_detail', 'ver/', 'pk'],
    steps: [
      ['video-15', 'Vídeo: a DetailView'],
      ['extra-detailview', 'A DetailView, a rota ver/ e o template do curso'],
      ['passo-34', 'Proteger com a permissão view_course e o botão Ver'],
    ],
  },
  {
    title: 'CreateView, criar',
    keywords: ['createview', 'criar', 'cadastro', 'cadastrar', 'create', 'modelform', 'formulario', 'form'],
    highlight: ['CreateView', 'ModelForm', 'CourseForm', 'course_create', 'criar/', 'form_class', 'success_url', 'csrf_token', 'form.as_p'],
    steps: [
      ['video-16', 'Vídeo: ModelForm e CreateView'],
      ['passo-23', 'O CourseForm, formulário feito a partir do model'],
      ['passo-24', 'A CreateView e a rota criar/'],
      ['video-17', 'Vídeo: o template de cadastro'],
      ['passo-25', 'O template de cadastro e o botão Novo curso'],
      ['passo-34', 'Exigir a permissão add_course'],
    ],
  },
  {
    title: 'UpdateView, editar',
    keywords: ['updateview', 'editar', 'edicao', 'update'],
    highlight: ['UpdateView', 'course_update', 'editar/', 'CourseForm', 'pk'],
    steps: [
      ['passo-23', 'O mesmo CourseForm serve para editar'],
      ['video-18', 'Vídeo: o Update'],
      ['passo-26', 'A UpdateView e a rota editar/'],
      ['passo-27', 'O template de edição e o botão Editar'],
      ['passo-34', 'Exigir a permissão change_course'],
    ],
  },
  {
    title: 'DeleteView, deletar',
    keywords: ['deleteview', 'deletar', 'excluir', 'exclusao', 'delete', 'apagar'],
    highlight: ['DeleteView', 'course_delete', 'deletar/', 'confirm_delete', 'CASCADE'],
    steps: [
      ['video-19', 'Vídeo: o Delete'],
      ['passo-28', 'A DeleteView e a rota deletar/'],
      ['passo-29', 'A página de confirmação e o botão Excluir'],
      ['passo-34', 'Exigir a permissão delete_course'],
    ],
  },
  {
    title: 'Login e permissões',
    keywords: ['login', 'logout', 'conta', 'contas', 'accounts', 'usuario', 'usuarios', 'permissao', 'permissoes', 'auth'],
    highlight: ['LoginView', 'LogoutView', 'LoginRequiredMixin', 'PermissionRequiredMixin', 'permission_required', 'login', 'logout', 'accounts', 'perms'],
    steps: [
      ['video-20', 'Vídeo: contas de usuário'],
      ['passo-30', 'O app accounts'],
      ['passo-31', 'O formulário de cadastro de usuário'],
      ['passo-32', 'As views de login, logout e cadastro'],
      ['passo-33', 'Os templates de login e cadastro'],
      ['video-21', 'Vídeo: protegendo as views'],
      ['video-22', 'Vídeo: botões por permissão'],
      ['passo-34', 'Exigir login e permissão nas views do CRUD'],
    ],
  },
  {
    title: 'Templates, static e Bootstrap',
    keywords: ['template', 'templates', 'static', 'css', 'bootstrap', 'base', 'extends'],
    highlight: ['templates', 'template', 'static', 'style.css', 'Bootstrap', 'base.html', 'extends', 'block', 'include'],
    steps: [
      ['video-9', 'Vídeo: templates e static'],
      ['passo-20', 'As pastas templates e static do app'],
      ['video-11', 'Vídeo: prévia do CRUD e Bootstrap'],
      ['extra-bootstrap', 'O Bootstrap pelo CDN'],
      ['video-12', 'Vídeo: o template base'],
      ['extra-base', 'O base.html, com menu, sidebar e rodapé'],
      ['passo-22', 'A primeira página que usa o base.html e o CSS'],
    ],
  },
  {
    title: 'Models e migrações',
    keywords: ['model', 'models', 'migracao', 'migracoes', 'migrate', 'makemigrations', 'banco'],
    highlight: ['makemigrations', 'migrate', 'models.py', 'models', 'model', 'ForeignKey', 'choices'],
    steps: [
      ['passo-7', 'A primeira migração, com as tabelas do Django'],
      ['passo-16', 'O app onde ficam os models'],
      ['video-6', 'Vídeo: criar os models'],
      ['passo-17', 'Os models Person e Course'],
      ['video-7', 'Vídeo: enviar os models para o banco'],
      ['passo-18', 'makemigrations e migrate'],
      ['passo-19', 'Os models no admin'],
    ],
  },
  {
    title: 'Painel admin',
    keywords: ['admin', 'jazzmin', 'superusuario', 'superuser'],
    highlight: ['admin', 'Jazzmin', 'createsuperuser', 'ModelAdmin', 'list_display'],
    steps: [
      ['passo-8', 'Criar o superusuário'],
      ['extra-jazzmin', 'Ajustar o tema Jazzmin'],
      ['video-8', 'Vídeo: o painel admin'],
      ['passo-19', 'Registrar os models no admin'],
    ],
  },
  {
    title: 'Git e GitHub',
    keywords: ['git', 'github', 'commit', 'push', 'gitignore', 'versionamento'],
    highlight: ['git', 'GitHub', 'commit', 'push', '.gitignore'],
    steps: [
      ['video-4', 'Vídeo: versionamento com Git'],
      ['passo-9', 'Instalar o Git'],
      ['passo-10', 'Criar o repositório no GitHub'],
      ['passo-11', 'O .gitignore'],
      ['passo-12', 'git init'],
      ['passo-13', 'Primeiro commit e push'],
      ['passo-14', 'O dia a dia: add, commit, push'],
      ['passo-15', 'Clonar em outro computador'],
    ],
  },
  {
    title: 'Ambiente virtual',
    keywords: ['venv', 'ambiente', 'virtual', 'pip', 'uv', 'instalar'],
    highlight: ['.venv', 'venv', 'pip', 'uv', 'Activate.ps1', 'activate'],
    steps: [
      ['video-1', 'Vídeo: ambiente sem o uv'],
      ['passo-2', 'Criar a .venv'],
      ['passo-3', 'Ativar a .venv'],
      ['passo-4', 'Instalar as bibliotecas com pip'],
      ['video-2', 'Vídeo: ambiente com o uv'],
      ['extra-uv', 'A alternativa com o uv'],
    ],
  },
];
