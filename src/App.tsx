/**
 * Componente App - Raiz da aplicação
 * Configura BrowserRouter e renderiza as rotas
 */

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { PwaControls } from './components/pwa/PwaControls';

/**
 * Componente principal da aplicação
 * Envolve toda a aplicação com BrowserRouter para ativar o React Router
 */
function App() {

  return (
    <BrowserRouter>
      <PwaControls />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
