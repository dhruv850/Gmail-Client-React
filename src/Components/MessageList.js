import React from "react";
import { getHeader, isEmpty, decodeHtml, removeQuote } from "./Helper";
import {
  Flex,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Avatar,
  Text,
  Spinner,
} from "@chakra-ui/core";

const SingleMessage = ({ name, subject, msg }) => (
  <Flex
    wrap='no-wrap'
    justify='space-around'
    py={2}
    borderTop='1px'
    borderBottom='1px'
    borderColor='gray.200'
    cursor='pointer'
  >
    <Avatar name={name} src='https://bit.ly/tioluwani-kolawole' />
    <Box w='80%'>
      <Text fontSize='sm' color='gray.700' isTruncated>
        {removeQuote(name)}
      </Text>
      <Text fontSize='md' fontWeight='bold' color='#3182ce' isTruncated>
        {subject}
      </Text>
      <Text fontSize='xs' color='gray.500'>
        {decodeHtml(msg)}
      </Text>
    </Box>
  </Flex>
);

const Messages = ({ messages, messagesRow }) => {
  console.log("Messages List Component");
  console.log(messagesRow);

  if (!isEmpty(messagesRow)) {
    return (
      <React.Fragment>
        <Flex
          direction='column'
          wrap='no-wrap'
          w='26%'
          h='100%'
          bg='#f1f1f1'
          color='black'
        >
          {/* Search bar */}
          <Box py='5px' bg='white' border='1px' borderColor='gray.200'>
            <InputGroup size='lg'>
              <InputLeftElement
                children={<Icon name='search' color='gray.300' />}
              />
              <Input
                type='text'
                placeholder='Search mail'
                borderWidth='0px'
                borderRadius='0px'
                focusBorderColor='white'
              />
            </InputGroup>
          </Box>

          {/* Message List */}
          <Box overflowY='auto'>
            {messagesRow.map((message) => (
              <SingleMessage
                key={message.id}
                name={removeQuote(
                  getHeader(message.payload.headers, "From").split("<")[0]
                )}
                subject={getHeader(message.payload.headers, "Subject")}
                msg={message.snippet.substr(0, 75)}
              />
            ))}
          </Box>
        </Flex>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        {/* Container */}
        <Flex
          direction='column'
          wrap='no-wrap'
          w='26%'
          h='100%'
          bg='#f1f1f1'
          color='black'
        >
          {/* Search bar */}
          <Box py='5px' bg='white' border='1px' borderColor='gray.200'>
            <InputGroup size='lg'>
              <InputLeftElement
                children={<Icon name='search' color='gray.300' />}
              />
              <Input
                type='text'
                placeholder='Search mail'
                borderWidth='0px'
                borderRadius='0px'
                focusBorderColor='white'
              />
            </InputGroup>
          </Box>

          {/* Message List */}
          <Box mt={6} display='flex' align='center' justifyContent='center'>
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          </Box>
        </Flex>
      </React.Fragment>
    );
  }
};

export default Messages;