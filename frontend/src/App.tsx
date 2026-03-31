import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import GalleryPage from './pages/GalleryPage'
import EditorPage from './pages/EditorPage'
import LoginPage from './pages/LoginPage'
import PostPage from './pages/PostPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts" element={<GalleryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/post/:id" element={<PostPage />} />

      <Route path="/editor/new" element={<EditorPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

