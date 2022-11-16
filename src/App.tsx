import React, { useEffect, useState } from 'react';
import {
  Input, Stack, InputGroup, InputLeftElement, HStack, Tag,
  TagLabel, TagCloseButton, InputRightElement, Button, TagRightIcon,
} from '@chakra-ui/react';
import './App.css';

import { FaDog, FaCheckCircle, FaRegEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface Pet {
  id: string,
  name: string
}

const superagent = require('superagent');

function App() {
  const [newPet, setNewPet] = useState('');
  const [edit, setEdit] = useState({
    editing: true,
    id: '',
    name: '',
  });
  const [pets, setPets] = useState<Pet[]>([]);

  // set inital state
  useEffect(() => {
    try {
      superagent
        .get('https://qvkvgz37ck.execute-api.eu-west-2.amazonaws.com/dev/pets')
        .then((res:any) => {
          setPets(res.body.pets.Items);
        });
    } catch (error) {
      console.error(error);
    }
  }, []);

  async function handleAdd(e:any) {
    e.preventDefault();
    const newPetObject = {
      id: uuidv4(),
      name: newPet,
    };

    setPets([
      ...pets,
      newPetObject,
    ]);

    try {
      await superagent
        .post('https://qvkvgz37ck.execute-api.eu-west-2.amazonaws.com/dev/pets')
        .send({ ...newPetObject });
    } catch (error) {
      console.error(error);
    }

    setNewPet('');
  }

  async function handleDelete(e:any, item:any) {
    e.preventDefault();
    const { id } = item;
    const filterArray = pets?.filter((pet) => item.id !== pet.id);
    setPets([
      ...filterArray,
    ]);
    try {
      await superagent
        .delete('https://qvkvgz37ck.execute-api.eu-west-2.amazonaws.com/dev/pets')
        .send({ id });
    } catch (error) {
      console.error(error);
    }
  }

  async function setNewName(e:any) {
    e.preventDefault();
    const newState = pets.map((pet) => {
      if (edit.id === pet.id) {
        return {
          ...pet,
          name: newPet,
        };
      }
      return pet;
    });
    setPets(newState);
    const updatedPet = {
      id: edit.id,
      name: newPet,
    };
    try {
      await superagent
        .post('https://qvkvgz37ck.execute-api.eu-west-2.amazonaws.com/dev/pets')
        .send({ ...updatedPet });
    } catch (error) {
      console.error(error);
    }

    setNewPet('');
    setEdit({
      ...edit,
      editing: !edit.editing,
      id: '',
      name: '',
    });
  }

  // trigged from the green card, passing the pet object and event

  function handleEdit(e:any, pet:any) {
    e.preventDefault();
    // set edit state and values of the pet you want to edit
    setEdit({
      ...edit,
      editing: !edit.editing,
      id: pet.id,
      name: pet.name,
    });
  }

  return (
    <div className="App">
      <Stack spacing={4} width={500} m={50}>
        {edit.editing !== false ? (
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
            >
              {' '}
              <FaDog color="gray.300" />
            </InputLeftElement>
            <Input
              type="name"
              placeholder="Pet Name"
              value={newPet}
              onChange={(e) => setNewPet(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAdd(e);
                }
              }}
            />
            <InputRightElement>

              <Button m="1rem" h="2rem" size="sm" onClick={(e) => handleAdd(e)}>
                <FaCheckCircle color="gray.300" />
              </Button>
            </InputRightElement>
          </InputGroup>
        ) : (
        // when editing is toggled
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
            >
              <FaDog color="gray.300" />
            </InputLeftElement>
            <Input
              type="name"
              placeholder={`What is ${edit.name}'s new name?`}
              value={newPet}
              onChange={(e) => setNewPet(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setNewName(e);
                }
              }}
            />
            <InputRightElement>

              <Button
                m="1rem"
                h="2rem"
                size="sm"
                onClick={(e) => setNewName(e)}
              >
                <FaRegEdit color="gray.300" />
              </Button>
            </InputRightElement>
          </InputGroup>

        ) }

        <HStack spacing={4}>
          {pets?.map((pet) => (
            <Tag
              size="lg"
              key={pet.id}
              borderRadius="full"
              variant="solid"
              colorScheme="green"
            >
              <TagLabel>{pet.name}</TagLabel>
              <TagRightIcon as={FaRegEdit} onClick={(e) => handleEdit(e, pet)} />
              <TagCloseButton onClick={(e) => handleDelete(e, pet)} />
            </Tag>
          ))}

        </HStack>
      </Stack>
    </div>
  );
}

export default App;
