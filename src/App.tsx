import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PokedexShell } from './components/layout/PokedexShell';
import { HomeScreen } from './components/screens/HomeScreen';
import { PokedexListScreen } from './components/screens/PokedexListScreen';
import { DexEntryScreen } from './components/screens/DexEntryScreen';
import { SaveManagerScreen } from './components/screens/SaveManagerScreen';
import { BoxViewScreen } from './components/screens/BoxViewScreen';
import { PartyViewScreen } from './components/screens/PartyViewScreen';
import { DiffResultScreen } from './components/screens/DiffResultScreen';
import { ExportScreen } from './components/screens/ExportScreen';
import { useInitializeApp } from './hooks/usePokedexRegistry';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PokedexShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'dex', element: <PokedexListScreen /> },
      { path: 'dex/:number', element: <DexEntryScreen /> },
      { path: 'saves', element: <SaveManagerScreen /> },
      { path: 'saves/:id/boxes', element: <BoxViewScreen /> },
      { path: 'saves/:id/party', element: <PartyViewScreen /> },
      { path: 'saves/:id/export', element: <ExportScreen /> },
      { path: 'diff', element: <DiffResultScreen /> },
    ],
  },
]);

function AppInit() {
  useInitializeApp();
  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppInit />;
}
