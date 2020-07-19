import React, { Fragment, useEffect, useState } from "react";

import MailboxList from "./Components/MailboxList/MailboxList";
import EmailList from "./Components/EmailList/EmailList";
import Email from "./Components/Email/Email";

import {markMessageAsRead} from "./Components/Helper";
import { ThemeProvider, CSSReset, Button, Flex } from "@chakra-ui/core";

var a;
const App = () => {
  // const [labels, setlabels] = useState([]); // Todo - sort labels dynamically
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState({});
  const [mailLimit, setMailLimit] = useState(30);
  const [categoryId,setcategoryId] = useState("INBOX");
  useEffect(() => {
    window.gapi.load("client:auth2", {
      callback: () => {
        // Handle gapi.client initialization.
        window.gapi.client.setApiKey(process.env.REACT_APP_API_KEY);
        window.gapi.auth.authorize(
          {
            client_id: process.env.REACT_APP_CLIENT_ID,
            scope: process.env.REACT_APP_SCOPES,
            immediate: true,
          },
          handleAuthResult
        );
      },
      onerror: function () {
        // Handle loading error.
        console.log("gapi.client failed to load!");
      },
      timeout: 5000, // 5 seconds.
      ontimeout: function () {
        // Handle timeout.
        console.log("gapi.client could not load in a timely manner!");
      },
    });
    // eslint-disable-next-line
  }, []);

  const handleAuthResult = (authResult) => {
    if (authResult && !authResult.error) {
      //console.log("Sign-in successful");
      hideAuthBtn();
      loadClient();
    } else {
      console.error("handleAuthResult...");
      console.error(authResult);
      displayAuthBtn();
    }
  };

  const hideAuthBtn = () => {
    document.getElementById("authBtn").style.display = "none";
  };

  const displayAuthBtn = () => {
    document.getElementById("authBtn").style.display = "block";
  };

  const handleAuthClick = () => {
    return window.gapi.auth.authorize(
      {
        client_id: process.env.REACT_APP_CLIENT_ID,
        scope: process.env.REACT_APP_SCOPES,
        immediate: false,
      },
      handleAuthResult
    );
  };

  const loadClient = () => {
    return window.gapi.client.load("gmail", "v1").then(
      (res) => {
      //  console.log("gapi client loaded for API");
        getMessages();
      },
      (err) => {
        console.error("Error loading window.gapi client for API", err);
      }
    );
  };

  // ----------- Functions to Get Data from Gmail Api ------------
  const getMessages = (labelIds = "INBOX") => {
    // Get List of 20 message's Id
    const request = window.gapi.client.gmail.users.messages.list({
      userId: "me",
      labelIds: labelIds,
      maxResults: mailLimit,
     
    });
    if(categoryId != labelIds)
    setMailLimit(30);
    setcategoryId(labelIds); 
    setMessages([]);
    // Send Id list to getMessagesData to get Message Data foreach Id
    request.execute(getMessagesData);
  };

  const getMessagesData = (response) => {
    const messages = response.result.messages ? response.result.messages : [];

    messages.forEach((message) => {
      window.gapi.client.gmail.users.messages
        .get({
          userId: "me",
          id: message.id,
         
        })
        .then(
          (response) => {
            setMessages((messages) => [...messages, response.result]);
          },
          (err) => {
            console.error("getMessagesData error", err);
          }
        );
    });
  };

  const getMessagesQuery = (query) => {
    // Get List of 20 message's Id
    const request = window.gapi.client.gmail.users.messages.list({
      userId: "me",
      q:query
    });


    setMessages([]);

    // Send Id list to getMessagesData to get Message Data foreach Id
    request.execute(getMessagesData);
  };

  

  const loadMore = () => {
    setMailLimit(mailLimit+20);
   
    getMessages(categoryId);
    
    
  }
 

  const resetstate = () => {
    setMailLimit(30);
    console.log("it is reset" +mailLimit);
  }
 

  const getOneMessage = (messageId) => {
    window.gapi.client.gmail.users.messages
      .get({
        userId: "me",
        id: messageId,
      })
      .then(
        (response) => {
          setMessage(response.result);
          markMessageAsRead(messageId);
        },
        (err) => {
          console.error("getMessage error", err);
        }
      );
  };

  

  return (
    <Fragment>
      <ThemeProvider>
        <CSSReset />
        <Button
          id='authBtn'
          display='none'
          variantColor='teal'
          variant='outline'
          onClick={handleAuthClick}
        >
          Authorize
        </Button>

        <Flex
          h='100vh'
          minH='600px'
          justify='space-arround'
          wrap='no-wrap'
          p='1em'
          bg='#e5f4f1'
          color='white'
        >
          <MailboxList getMessages={getMessages} resetstate={resetstate} getMessagesQuery={getMessagesQuery} />
          <EmailList getOneMessage={getOneMessage} loadMore={loadMore}  messages={messages} getMessagesQuery={getMessagesQuery}/>
          <Email message={message} />
          
        </Flex>
      </ThemeProvider>
    </Fragment>
  );
};

export default App;
