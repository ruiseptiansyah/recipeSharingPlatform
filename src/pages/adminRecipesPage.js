import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Text,
    Input,
    Select,
    IconButton,
  } from "@chakra-ui/react";
  import { Eye, Trash2 } from "lucide-react";
  import axios from "axios";
  import AdminLayout from "../components/AdminLayout";
  import { useEffect, useState, useCallback } from "react";
  import dayjs from "dayjs";
  
  const AdminRecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const toast = useToast();
    const token = localStorage.getItem("adminToken");
  
    const {
      isOpen: isDeleteOpen,
      onOpen: onDeleteOpen,
      onClose: onDeleteClose,
    } = useDisclosure();
  
    const {
      isOpen: isDetailOpen,
      onOpen: onDetailOpen,
      onClose: onDetailClose,
    } = useDisclosure();
  
    const fetchRecipes = useCallback(async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
      } catch (error) {
        console.error("Gagal mengambil data resep:", error);
      }
    }, [token]);
  
    useEffect(() => {
      fetchRecipes();
    }, [fetchRecipes]);
  
    const handleOpenDeleteModal = (id) => {
      setSelectedRecipeId(id);
      onDeleteOpen();
    };
  
    const handleDeleteRecipe = async () => {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/recipes/${selectedRecipeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast({
          title: "Resep dihapus",
          description: "Resep berhasil dihapus dari database.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchRecipes();
        onDeleteClose();
      } catch (error) {
        toast({
          title: "Gagal menghapus",
          description:
            error.response?.data?.message || "Terjadi kesalahan saat menghapus.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
    const recipesPerPage = 6;
  
    const filteredRecipes = recipes.filter((recipe) => {
      return (
        recipe.title.toLowerCase().includes(search.toLowerCase()) &&
        (categoryFilter ? recipe.category === categoryFilter : true)
      );
    });
  
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  
    return (
      <AdminLayout>
        <Box p={4}>
            <Text fontSize="2xl" mb={4} fontWeight="bold">
                Data Resep
            </Text>
          <Box display="flex" justifyContent="space-between" mb={4} gap={4}>
            <Input
              placeholder="Cari judul resep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="Filter kategori"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {[...new Set(recipes.map((r) => r.category))].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </Box>
  
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Judul</Th>
                <Th>Kategori</Th>
                <Th>User ID</Th>
                <Th>Dibuat</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentRecipes.map((recipe) => (
                <Tr key={recipe.id}>
                  <Td>{recipe.title}</Td>
                  <Td>{recipe.category}</Td>
                  <Td>{recipe.user_id}</Td>
                  <Td>{dayjs(recipe.created_at).format("DD MMM YYYY")}</Td>
                  <Td>
                    <IconButton
                      icon={<Eye size={18} />}
                      colorScheme="teal"
                      aria-label="Lihat Detail"
                      size="sm"
                      mr={2}
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        onDetailOpen();
                      }}
                    />
                    <IconButton
                      icon={<Trash2 size={18} />}
                      colorScheme="red"
                      aria-label="Hapus Resep"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(recipe.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
  
          {/* Pagination */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                colorScheme={page === currentPage ? "blue" : "gray"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </Box>
  
          {/* Modal Konfirmasi Hapus */}
          <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Konfirmasi Hapus Resep</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Apakah kamu yakin ingin menghapus resep ini?</Text>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onDeleteClose} mr={3}>Batal</Button>
                <Button colorScheme="red" onClick={handleDeleteRecipe}>Hapus</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
  
          {/* Modal Detail Resep */}
          <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Detail Resep</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedRecipe && (
                  <Box>
                    <Text><strong>Judul:</strong> {selectedRecipe.title}</Text>
                    <Text><strong>Kategori:</strong> {selectedRecipe.category}</Text>
                    <Text mt={2}><strong>Bahan:</strong><br />{selectedRecipe.ingredients}</Text>
                    <Text mt={2}><strong>Instruksi:</strong><br />{selectedRecipe.instructions}</Text>
                    <Text mt={2}><strong>Dibuat Pada:</strong> {dayjs(selectedRecipe.created_at).format("DD MMM YYYY")}</Text>
                    {selectedRecipe.image_url && (
                      <Box mt={3}>
                        <img
                          src={selectedRecipe.image_url}
                          alt={selectedRecipe.title}
                          style={{ maxWidth: "100%", borderRadius: "8px" }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={onDetailClose}>Tutup</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </AdminLayout>
    );
  };
  
  export default AdminRecipesPage;
  