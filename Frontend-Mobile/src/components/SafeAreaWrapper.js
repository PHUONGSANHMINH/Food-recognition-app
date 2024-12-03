import React from 'react'
import { SafeAreaView } from 'react-native'

const SafeAreaWrapper = ({ children }) => {
  return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
}

export default SafeAreaWrapper
