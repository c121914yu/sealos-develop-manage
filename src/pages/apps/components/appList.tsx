import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { MOCK_APPS } from "@/mock/apps";
import styles from "./appList.module.scss";
import { appsItemType } from "@/types/app";

const AppList = () => {
  const columns = [
    {
      title: "名字",
      key: "name",
      render: (item: appsItemType) => {
        return (
          <div>
            <p>{item.name}</p>
            <p className={styles.idText}>{item.id}</p>
          </div>
        );
      },
    },
    {
      title: "状态",
      key: "status",
      render: (item: appsItemType) => (
        <div className={styles.status}>{item.status}</div>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "CPU",
      dataIndex: "cpu",
      key: "cpu",
    },
    {
      title: "内存",
      dataIndex: "storage",
      key: "storage",
    },
    {
      title: "副本数",
      dataIndex: "copyAmount",
      key: "copyAmount",
    },
    {
      title: "操作",
      key: "control",
    },
  ];

  const router = useRouter();

  return (
    <Box p={34} minH="100vh" className={styles.appList}>
      <Box
        display={"flex"}
        alignItems={"flex-start"}
        justifyContent={"space-between"}
      >
        <Box display={"flex"} alignItems={"center"}>
          <Image
            className=""
            src="/imgs/no-app.svg"
            width={46}
            height={44}
            alt=""
          ></Image>
          <h5>
            <strong>应用列表</strong>
          </h5>
        </Box>

        <Button
          flex={"0 0 155px"}
          colorScheme={"blue"}
          onClick={() => router.push("/app/edit")}
        >
          新建应用
        </Button>
      </Box>
      <TableContainer>
        <Table variant={"simple"}>
          <Thead>
            <Tr>
              {columns.map((item) => (
                <Th key={item.key}>{item.title}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {MOCK_APPS.map((item) => (
              <Tr key={item.id}>
                {columns.map((col) => (
                  <Td key={col.key}>
                    {col.render
                      ? col.render(item)
                      : col.dataIndex
                      ? item[col.dataIndex]
                      : ""}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AppList;
