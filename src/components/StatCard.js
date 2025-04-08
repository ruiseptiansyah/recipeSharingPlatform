import React from "react";
import { Card, CardBody, Heading, Text } from "@chakra-ui/react";

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <Card borderRadius="2xl" shadow="lg">
      <CardBody>
        <Heading size="md" mb={2}>
            {Icon && <Icon size={20} />} {title}
        </Heading>
        {typeof value === "string" || typeof value === "number" ? (
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
        ) : (
            value
        )}
      </CardBody>
    </Card>
  );
};

export default StatCard;