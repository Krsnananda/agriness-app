import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator, Dimensions, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation, StackActions } from "@react-navigation/native";
import AuthContext from './../contexts/auth'

import axios from "axios";
import { urls } from './../services/urls'

import remove from './../../assets/remove.png'
import { LogoutArea, LogoutButtom, LogoutText } from "../styles/app";
import {
  Card,
  Container,
  Data,
  Filter,
  Header,
  Info,
  PaginationButton,
  Title,
  TitleButton,
} from "../styles/home";


export default function Home() {
  const { dispatch } = useNavigation()
  const { signOut } = useContext(AuthContext)

  const [allAnimals, setAllAnimals] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [beginListing, setBeginListing] = useState(10)
  const [isLoading, setisLoading] = useState(false)
  const [isPaginating, setisPaginating] = useState(false)

  const height = Dimensions.get('screen').height

  useEffect(() => {
    setisLoading(true)
    axios.get(urls.farm).then((res) => {
      setAllAnimals(res.data)
      setFilteredList(res.data)
      setisLoading(false)
    }).catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    setBeginListing(10)
  }, [isLoading])

  async function deleteItem(id) {
    try {
      const url = urls.farm + '/' + id
      const response = await axios.delete(url)

      console.log(response.data)
      Alert.alert(
        "Registro deletado!",
        "",
        [
          {
            text: 'Ok', onPress: () => updateList(id)
          }
        ]
      )

    } catch (error) {
      console.error(error)
    }
  }

  function updateList(id) {
    setFilteredList([...allAnimals.filter(e => e.id !== id)])
  }

  function handlePagination() {
    setisPaginating(true)
    setTimeout(() => {
      setBeginListing(beginListing + 10)
      setisPaginating(false)
    }, 2000);
  }

  const setStatusFilter = text => {
    const newList = allAnimals.filter(e => {
      const location = e.localizacao.toLowerCase()
      const myText = text.toLowerCase()

      text.length ? setBeginListing(allAnimals.length) : setBeginListing(10)

      return location.indexOf(myText) > -1;
    })

    setFilteredList(newList)
  }

  return (
    <Container contentContainerStyle={{ alignItems: 'center' }}>
      {isLoading ? (
        <View style={{ justifyContent: 'center', height: height / 1.5 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <LogoutArea>
            <LogoutButtom onPress={() => {
              Alert.alert(
                "Deseja realmente sair ?",
                "",
                [
                  { text: 'Cancelar', onPress: console.log("Cancel Pressed"), style: 'cancel' },
                  { text: 'Ok', onPress: () => signOut() }
                ]
              )
            }}>
              <LogoutText>SAIR</LogoutText>
            </LogoutButtom>
          </LogoutArea>
          <Filter placeholder={'Pesquise por localização'} autoCapitalize="none" onChangeText={(text) => setStatusFilter(text)} />

          {filteredList.slice(0, beginListing).map((item, index) => (
            <Card key={index} onPress={() => {
              const pushAction = StackActions.push('Perfil', { info: item })
              dispatch(pushAction)
            }}>
              <View style={{ top: 0, right: 0, alignItems: 'flex-end' }}>
                <TouchableOpacity style={{ width: 30 }} onPress={() => deleteItem(item.id)}>
                  <Image source={remove} style={{ width: 30, height: 30, alignSelf: 'flex-end' }} />
                </TouchableOpacity>
              </View>
              <Info>
                <Title>Nome: </Title>
                <Data>{item.nome}</Data>
              </Info>
              <Info>
                <Title>Localização: </Title>
                <Data>{item.localizacao}</Data>
              </Info>
            </Card>
          ))}
          {isPaginating ? (
            <ActivityIndicator color="#000" size="large" />
          ) : (
            filteredList && filteredList.length ? (
              <PaginationButton onPress={() => handlePagination()}>
                <TitleButton>Ver mais</TitleButton>
              </PaginationButton>
            ) : (
              <Title>Não há resultados para essa busca!</Title>
            )
          )}
        </>
      )}
    </Container>


  )
}
