import React, { Fragment,useState } from "react";
import { Base64 } from "js-base64";
import { MdArrowForward } from "react-icons/md";
import { getHeader } from "../Helper";
import PropTypes from "prop-types";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  Textarea,
  useToast,
  useDisclosure,
  Box,
  Text,
} from "@chakra-ui/core";
import {FormGroup,ListGroup,ListGroupItem} from "react-bootstrap";
import Dropzone from 'react-dropzone';

import filesize from 'filesize'


const ForwardModel = ({ forwardData, getMessageBody }) => {
  const [attachments,setattachments] = useState([]);
  const [dropzoneActive,setdropzoneActive] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const emailTo = form.elements["emailTo"].value;
    const subject = form.elements["subject"].value;
    
    // Send Replay
    sendMessage(
      {
        To: emailTo,
        Subject: subject,
      },
      
      getMessageBody(forwardData.payload),
     
      displayToast,
      
    );

    onClose();
  };

  const sendMessage = (headers_obj, message, callback) => {
    console.log(attachments);
    let email = [
      'Content-Type: multipart/mixed; boundary="my_boundary"',
      'MIME-Version: 1.0'
    ];
    for (let h in headers_obj) {
      console.log(headers_obj);
      email.push(`${h}: ${headers_obj[h]}`)
    }

    email.push(
      '',
      '--my_boundary'
    );

    if(!/^\s*$/.test(message)) {
      email.push(
        'Content-Type: text/html; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        '',
        `${message}`,
        '',
        '--my_boundary'
      )
    }

    if (attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        email.push(
          `Content-Type: ${attachments[i].type}`,
          'MIME-Version: 1.0',
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachments[i].name}"`,
          '',
          btoa(attachments[i].blob),
          '',
          '--my_boundary'
        )
      }
    }

    const encode = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    email = encode(email.join('\r\n') + '--');

    
    const request = window.gapi.client.gmail.users.messages.send({
      userId: "me",
      resource: {
        raw: email,
      },
    });
    setattachments([]);
    request.execute(callback);
  };

  const displayToast = ({ result }) => {
    if (result.labelIds.indexOf("SENT") !== -1) {
      toast({
        title: "Message Sent.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "An error occurred.",
        description: "Unable to sent your replay.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  var onDrop = (files) => {
    setdropzoneActive({dropzoneActive: false});
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = () => {
        setattachments((attachments) => 
          [
            ...attachments,
            {
              name: files[i].name,
              size: files[i].size,
              type: files[i].type,
              blob: reader.result
            }
          ]
        )
      };
      reader.readAsBinaryString(files[i]);
    }
  }
  var removeAttachment =(file) => {
    setattachments(
      attachments.filter(item => item !== file)
    )
  }
  var dropzoneRef;

  const dropzoneOverlayStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: '2.5em 0',
    
    textAlign: 'center',
    
  };

  const getForwardHead = (headers) => {
    let msg = "";
    msg += "From: " + getHeader(headers, "From") + "\r\n";
    msg += "Date: " + getHeader(headers, "Date") + "\r\n";
    msg += "Subject: " + getHeader(headers, "Subject") + "\r\n";
    msg += "To: " + getHeader(headers, "To") + "\r\n";
    return msg;
  };

  return (
    <Fragment>
      <Button
        rightIcon={MdArrowForward}
        variantColor='blue'
        variant='outline'
        onClick={onOpen}
      >
       Forward
      </Button>
      <Modal
        isOpen={isOpen}
        size='full'
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reply Email </ModalHeader>
          <ModalCloseButton />
          <form id='form' onSubmit={handleSubmit}>
            <ModalBody>
            <FormControl isRequired>
                <Input
                  marginTop="10px"
                  type='email'
                  id='emailTo'
                  placeholder='To'
                  aria-describedby='email-helper-text'
                />
              </FormControl>
              <FormControl isRequired>
                <Input
                   marginTop="10px"
                  type='text'
                  id='subject'
                  placeholder='Subject'
                  aria-describedby='subject-email-helper-text'
                  value={getHeader(forwardData.payload.headers, "Subject")}
                  readOnly
                />
              </FormControl>
              
              <FormControl isRequired>
                <Textarea
                  id='message'
                  minH='280px'
                  size='xl'
                  resize='vertical'
                  value={
                    "------Forward Message------\r\n" +
                    getForwardHead(forwardData.payload.headers)
                  }
                  readOnly

                />
              </FormControl>
              <FormGroup>
                <Box >
              <Dropzone

              disableClick
              style={{position: "relative"}}
              onDrop={onDrop}
              onDragEnter={() => setdropzoneActive({dropzoneActive: true})}
              onDragLeave={() => setdropzoneActive({dropzoneActive: false})}
              ref={(node) => {
                dropzoneRef = node;
              }}
            > 
             {attachments.length>0? (""):(<div style={dropzoneOverlayStyle}>
            You can also Drop Files Here
            </div>)}
            </Dropzone>
            </Box>
            </FormGroup>
            <ListGroup >
               <Text fontSize="xl">Attachments:</Text>
               <Box marginTop="10px" >
            {attachments.map((file, index) => (
              <Text as="ins" marginTop="3px" >
              <ListGroupItem  key={index} listItem={true}>
                {file.name} ({filesize(file.size)})
                <Button
                  onClick={() => removeAttachment(file)}
                  className='btn-link badge close'
                >
                  &times;
                </Button>
              </ListGroupItem>
               </Text>
            )
           
            )}
            </Box>
          </ListGroup>
            </ModalBody>

            <ModalFooter>
            <Button variantColor='blue' mr={3}  variant="outline" onClick={() => {
              dropzoneRef.open()
            }}>
              Attach Files
            </Button>
              <Button type='reset' variantColor='blue' mr={3} onClick={onClose}>
                Close
              </Button>
              <Button type='submit' variantColor='green'>
                Send
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};

export default ForwardModel;

ForwardModel.prototype = {
  forwardData: PropTypes.object.isRequired,
  getMessageBody: PropTypes.func.isRequired,
};
