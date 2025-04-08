// ...import tetap sama
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useToast,
  Input,
  Select,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Trash2, Pencil } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import dayjs from "dayjs";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: "", email: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const toast = useToast();

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: openEditModal,
    onClose: closeEditModal,
  } = useDisclosure();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Gagal fetch users", err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/admin/users/${selectedUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "User berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gagal hapus user", err);
      toast({
        title: "Gagal menghapus user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!editUserData.username.trim() || !editUserData.email.trim()) {
      toast({
        title: "Semua field harus diisi",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserData.email)) {
      toast({
        title: "Format email tidak valid",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`http://localhost:5000/api/admin/users/${selectedUserId}`, editUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "User berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      console.error("Gagal update user", err);
      toast({
        title: "Gagal memperbarui user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerSearch) ||
          user.email.toLowerCase().includes(lowerSearch)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <AdminLayout>
      <Box px={{ base: 4, md: 8 }} py={4}>
        <Text fontSize="2xl" mb={4} fontWeight="bold">
          Data Pengguna
        </Text>

        <Box display="flex" gap={4} mb={4} flexWrap="wrap">
          <Input
            placeholder="Cari username atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            w={{ base: "100%", md: "50%" }}
          />
          <Select
            placeholder="Filter Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            w={{ base: "100%", md: "30%" }}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Select>
        </Box>

        <TableContainer w="full" overflowX="auto">
            <Table variant="simple">
                <Thead bg="gray.100">
                <Tr>
                    <Th>ID</Th>
                    <Th>Username</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Dibuat Pada</Th>
                    <Th>Aksi</Th>
                </Tr>
                </Thead>
                <Tbody>
                {currentUsers.map((user) => (
                    <Tr key={user.id}>
                    <Td>{user.id}</Td>
                    <Td>{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                        <Badge colorScheme={user.role === "admin" ? "purple" : "green"}>
                        {user.role}
                        </Badge>
                    </Td>
                    <Td>{dayjs(user.created_at).format("DD MMM YYYY")}</Td>
                    <Td>
                        <HStack spacing={2}>
                        <IconButton
                            colorScheme="blue"
                            aria-label="Edit User"
                            icon={<Pencil size={18} />}
                            onClick={() => {
                            setSelectedUserId(user.id);
                            setEditUserData({ username: user.username, email: user.email });
                            openEditModal();
                            }}
                        />
                        <IconButton
                            colorScheme="red"
                            aria-label="Hapus User"
                            icon={<Trash2 size={18} />}
                            onClick={() => {
                            setSelectedUserId(user.id);
                            openModal();
                            }}
                        />
                        </HStack>
                    </Td>
                    </Tr>
                ))}
                </Tbody>
            </Table>
            </TableContainer>


        <HStack justify="center" mt={1} spacing={1}>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={i + 1 === currentPage ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </HStack>

        {/* Modal Konfirmasi Hapus */}
        <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Konfirmasi Penghapusan</ModalHeader>
            <ModalBody>
              Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeModal}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Hapus
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Edit */}
        <Modal isOpen={isEditOpen} onClose={closeEditModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Pengguna</ModalHeader>
            <ModalBody>
              <FormControl mb={4} isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  value={editUserData.username}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, username: e.target.value })
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, email: e.target.value })
                  }
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeEditModal}>
                Batal
              </Button>
              <Button colorScheme="blue" onClick={handleEditSubmit}>
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

export default AdminUsersPage;
