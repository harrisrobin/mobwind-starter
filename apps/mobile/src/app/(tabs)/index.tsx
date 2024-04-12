import { StyleSheet } from "react-native"
import { Text, View } from "react-native"

import EditScreenInfo from "@/components/EditScreenInfo"
import { Test } from "@repo/ui/src/test"

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text className="text-2xl text-red-400">Tab One</Text>
      <View className="bg-slate-900 w-12 h-12" />
      <Test />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
})
