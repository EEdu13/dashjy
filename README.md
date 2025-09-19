# JY Agroflorestal - Dashboard de Qualidade

🌱 Sistema completo de monitoramento e controle de qualidade para avaliações agroflorestais.

## 🚀 Deploy Links
- **GitHub**: https://github.com/EEdu13/dashjy
- **Railway**: [Link será atualizado após deploy]
- **Demo**: [Aguardando deploy]

## ✨ Funcionalidades

### 📊 Dashboard Interativo
- Visualização de métricas em tempo real
- Cards dinâmicos com estatísticas
- Filtros por fazenda e talhão
- Gráficos de não conformidades contextuais

### ✏️ Modo Edição
- Edição inline dos dados da tabela
- Salvamento direto no PostgreSQL
- Validação de entrada numérica
- Indicadores visuais de alterações pendentes

### � Documentação Fotográfica
- Upload de fotos da área e linha
- Visualização e ampliação de imagens
- Armazenamento integrado ao sistema

### 🗄️ Base de Dados
- PostgreSQL hospedado no Railway
- API RESTful completa
- Sincronização em tempo real

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Design responsivo com Glassmorphism
- Interface moderna e intuitiva

### Backend
- Node.js + Express.js
- PostgreSQL (Railway Cloud)
- API REST com validação

## 🚀 Deploy Local

```bash
# Clonar repositório
git clone https://github.com/EEdu13/dashjy.git
cd dashjy

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar servidor
npm start
```

## 📡 API Endpoints

### Consultas
- `GET /api/avaliacoes` - Lista todas avaliações
- `GET /api/avaliacoes?fazenda=X&talhao=Y` - Filtrar
- `GET /api/fazendas` - Lista fazendas
- `GET /api/talhoes` - Lista talhões

### Atualizações
- `PUT /api/avaliacoes/:id` - Atualiza avaliação
- `POST /api/avaliacoes/bulk-update` - Atualiza múltiplas

### Utilitários
- `GET /health` - Status do servidor

## 🗄️ Estrutura do Banco

### Schema: `qualidadejy`
### Tabela: `sobrevivencia`

**Campos principais:**
- **Identificação**: id, data_avaliacao, fazenda, talhao
- **Plantio**: clone, data_plantio, dias_avaliacao
- **Quantidades**: mudas_avaliadas, area_talhao, area_avaliada
- **Equipe**: avaliador, viveiro, status_carga
- **Não conformidades**: quebradas, formigas, pisoteadas, etc.
- **Documentação**: foto_area, foto_linha

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# PostgreSQL Railway
PGHOST=ballast.proxy.rlwy.net
PGPORT=21526
PGUSER=postgres
PGPASSWORD=CqdPHkjnPksiOYxCKVZtFUUOIGDIlPNr
PGDATABASE=railway

# Servidor
PORT=8000
HOST=0.0.0.0

# Database
DB_SCHEMA=qualidadejy
DB_TABLE=sobrevivencia
```

## � Como Usar

### 🔍 Navegação
1. **Filtros**: Use os dropdowns para filtrar por fazenda/talhão
2. **Tabela**: Scroll horizontal para ver todos os campos
3. **Detalhes**: Clique em uma linha para ver modal completo

### ✏️ Edição
1. **Ativar**: Clique em "✏️ Modo Edição"
2. **Editar**: Clique nas células verdes para editar
3. **Confirmar**: Enter ou clique fora para confirmar
4. **Salvar**: Use "💾 Salvar Alterações"

### 📸 Fotos
1. **Visualizar**: Clique na foto para ampliar
2. **Upload**: Use "📤 Adicionar Foto" se não houver
3. **Ampliar**: Modal dedicado para visualização

## � Deploy Railway

### Passos para Deploy:
1. **Push para GitHub**
2. **Conectar Railway ao repositório**
3. **Configurar variáveis de ambiente**
4. **Deploy automático**

### Configurações Railway:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: $PORT (automático)

## 🎯 Campos Editáveis

- **Quantidades**: mudas_avaliadas
- **Áreas**: area_talhao, area_avaliada  
- **Não conformidades**: quebradas, formigas, pisoteadas, etc.
- **Documentação**: foto_area, foto_linha

## 🔒 Segurança

- Conexão SSL com PostgreSQL
- Validação de dados de entrada
- Sanitização de queries SQL
- CORS configurado adequadamente

## 🐛 Troubleshooting

### Erro de Conexão
1. Verificar credenciais PostgreSQL
2. Confirmar conectividade Railway
3. Checar logs do servidor

### Modo Edição
1. Verificar console do navegador
2. Confirmar servidor ativo
3. Validar permissões

---
**🌱 JY Agroflorestal** - Sistema de Controle de Qualidade v1.0  
Desenvolvido para otimização de plantações e monitoramento em tempo real.