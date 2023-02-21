import React from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import Icon from "@/components/Icon";

interface Props {
  yamlList?: { filename: string; value: string }[];
}

const Yaml = ({ yamlList = [] }: Props) => {
  return (
    <Box border={"1px dashed #DCDCDC"} height={"100%"} px={"20px"} py={"16px"}>
      <Flex
        borderBottom={"1px solid #E5E7E9"}
        pb={5}
        align={"center"}
        justifyContent={"space-between"}
      >
        <Box>yaml 配置文件</Box>
        <Button mt={3} width={155}>
          <Icon name="icon-plus" color="#666666"></Icon>
          新增 configmap
        </Button>
      </Flex>
    </Box>
  );
};

export default Yaml;
