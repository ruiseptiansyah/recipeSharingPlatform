import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import { List, ListItem, ListIcon, SimpleGrid, Text } from "@chakra-ui/react";
import {
  BookOpen,
  Users,
  Star,
  Tag,
  BarChart2,
  CheckCircle
} from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;
        console.log("DASHBOARD DATA:", res.data);

        const avgRating = parseFloat(data.avgRatings?.[0]?.average_rating || 0);
        console.log("AVG RATING RAW:", data.avgRatings);


        setStats({
          totalRecipes: data.totalRecipes,
          totalUsers: data.totalUsers,
          topCategories: data.topCategories,      // array of top kategori
          popularRecipes: data.popularRecipes,    // array of top resep
          avgRating,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <Text>Loading Dashboard...</Text>;

  return (
    <AdminLayout>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <StatCard title="Total Resep" value={stats.totalRecipes} icon={BookOpen} />
        <StatCard title="Jumlah Pengguna" value={stats.totalUsers} icon={Users} />

        <StatCard
            title="Kategori Terpopuler (Top 3)"
            value={
                <List spacing={1}>
                {stats.topCategories.slice(0, 3).map((item, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={CheckCircle} color="teal.500" />
                    {item.category}
                    </ListItem>
                ))}
                </List>
            }
            icon={Tag}
        />

        <StatCard
          title="Resep Paling Populer"
          value={
            <List spacing={1}>
              {stats.popularRecipes.slice(0, 3).map((item, index) => (
                <ListItem key={index} display="flex" alignItems="center">
                  <ListIcon as={CheckCircle} color="orange.400" />
                  {item.title}
                </ListItem>
              ))}
            </List>
          }
          icon={BarChart2}
        />

        <StatCard
          title="Rating Rata-rata"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
        />
      </SimpleGrid>
    </AdminLayout>
  );
};

export default AdminDashboard;