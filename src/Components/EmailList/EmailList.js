import React,{useState} from "react";
import { getHeader, isEmpty, decodeHtml, removeQuote } from "../Helper";
import PropTypes from "prop-types";
import {
  Flex,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  IconButton,
  Avatar,
  Text,
  Spinner,
  Button
} from "@chakra-ui/core";


const EmailList = ({ getOneMessage, messages,loadMore,getMessagesQuery  }) => {
  const handleMessageClick = (e) => {
    const messageId = e.currentTarget.getAttribute("id");
    getOneMessage(messageId);
    //console.log(messageId);
  };
  const handlequery = () => {
    
    getMessagesQuery(query);
    setState({query:''})
    //console.log(messageId);
  };
  
  const [state, setState] = useState({
    query: '',
});

const { query } = state;

// onchange event handler
const handleChange = name => event => {
    // console.log('name', name, 'event', event.target.value);
    setState({ ...state, [name]: event.target.value });
    var query = event.target.value;
    console.log(query)
};
  
  

  return (
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
        <IconButton variant='outline' marginLeft="5px" variantColor="blue" aria-label="Search database" icon="search" onClick={handlequery} />
          <Input
            type='text'
            marginLeft="5px"
            placeholder='Search mail'
            borderWidth='0px'
            borderRadius='0px'
            focusBorderColor='white'
            onChange={handleChange('query')}
            value={query}
          />
        </InputGroup>
      </Box>

      {/* Message List */}
      {isEmpty(messages) ? (
        <Box mt={6} display='flex' align='center' justifyContent='center'>
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
        </Box>
      ) : (
        <Box overflowY='auto'>
          {messages.map((message) => {
            const name = removeQuote(
              getHeader(message.payload.headers, "From").split("<")[0]
            );
            const subject = getHeader(message.payload.headers, "Subject");
            const msg = decodeHtml(message.snippet.substr(0, 75));
            const backgroundColor =
              message.labelIds.indexOf("UNREAD") > -1 ? "#fff" : "#E2E8F0";

            return (
              <Flex
                key={message.id}
                id={message.id}
                onClick={handleMessageClick}
                
                wrap='no-wrap'
                justify='space-around'
                py={2}
                bg={backgroundColor}
                borderTop='1px'
                borderBottom='1px'
                borderColor='gray.300'
                cursor='pointer'
              >
                <Avatar name={name} src='https://bit.ly/tioluwani-kolawole' />
                <Box w='80%'>
                  <Text fontSize='sm' color='gray.700' isTruncated>
                    {name}
                  </Text>
                  <Text
                    fontSize='md'
                    fontWeight='bold'
                    color='#3182ce'
                    isTruncated
                  >
                    {subject}
                  </Text>
                  <Text fontSize='xs' color='gray.500'>
                    {msg}
                  </Text>
                </Box>
              </Flex>
            );
          })}
           <Button width="100%"
              variantColor='teal'
              variant='outline'
              onClick={() => loadMore()}>
              Load More...
            </Button>
        </Box>
      )}
    </Flex>
  );
};

export default EmailList;

EmailList.prototype = {
  
  getOneMessage: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
};
