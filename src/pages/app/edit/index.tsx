import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Button, Flex, Grid } from "@chakra-ui/react";
import { json2Service } from "./yamljs";
import Icon from "@/components/Icon";
import Form from "./components/Form";
import Yaml from "./components/Yaml";

const EditApp = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    console.log(
      json2Service({
        name: "十大歌手的",
      })
    );
  }, []);

  const FormDon = useRef<any>();

  return (
    <Box minWidth={"1100px"} px={10} pt="70px">
      <Flex
        px={10}
        height="70px"
        alignItems={"center"}
        justifyContent={"space-between"}
        position="fixed"
        top={0}
        left={0}
        right={0}
        backgroundColor="#fff"
        zIndex={1}
      >
        <Flex
          alignItems={"center"}
          cursor={"pointer"}
          onClick={() => router.back()}
        >
          <Box mr={5}>
            <Icon name="icon-left-arrow" />
          </Box>
          <h4>
            <strong>应用配置</strong>
          </h4>
        </Flex>
        <Button
          flex={"0 0 155px"}
          colorScheme={"blue"}
          onClick={() => {
            FormDon.current?.apply();
          }}
        >
          部署应用
        </Button>
      </Flex>
      <Grid
        gridTemplateColumns={"1fr 480px"}
        gap={20}
        maxWidth={1100}
        mx={"auto"}
        position="relative"
        height={"calc(100vh - 100px)"}
      >
        <Box height={"100%"} pr={5} overflow="auto">
          <Form ref={FormDon} />
        </Box>
        <Box>
          <Yaml />
        </Box>
      </Grid>
    </Box>
  );
};

export default EditApp;
