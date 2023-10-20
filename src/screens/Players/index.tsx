import { Alert, FlatList, TextInput } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AmountPlayers, Container, Form, HeaderList } from "./styles";
import { Header } from "@components/Header";
import { HighLight } from "@components/HighLight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Filter } from "@components/Filter";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { playersGetByGroupAndTeam } from "@storage/player/playersGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
  group: string;
};

export function Players() {
  const [isLoading, setIsLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Time A");
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

  const route = useRoute();
  const navigation = useNavigation();

  const { group } = route.params as RouteParamsProps;

  const newPlayerNameInputRef = useRef<TextInput>(null);

  const handleAddPlayer = async () => {
    if (newPlayerName.trim().length === 0) {
      return Alert.alert("Nova pessoa", "Informe o nome do novo participante");
    }

    const newPlayer = {
      name: newPlayerName,
      team: selectedTeam,
    };

    try {
      await playerAddByGroup(newPlayer, group);

      newPlayerNameInputRef.current?.blur();

      setNewPlayerName("");
      fetchPlayersByTeam();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Nova pessoa", error.message);
      } else {
        Alert.alert("Nova pessoa", "Não foi possível adicionar");
      }
    }
  };

  const fetchPlayersByTeam = async () => {
    try {
      setIsLoading(true);
      const playersByTeam = await playersGetByGroupAndTeam(group, selectedTeam);
      setPlayers(playersByTeam);
    } catch (error) {
      Alert.alert(
        "Pessoas",
        "Não foi possível listar as pessoas do time selecionado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlayer = async (playerName: string) => {
    try {
      await playerRemoveByGroup(playerName, group);
      fetchPlayersByTeam();
    } catch {
      Alert.alert(
        "Remover pessoa",
        `Não foi possível remover a pessoa ${playerName}`
      );
    }
  };

  const groupRemove = async () => {
    try {
      groupRemoveByName(group);
      navigation.navigate("groups");
    } catch {
      Alert.alert("Remover grupo", `Não foi possível remover o grupo ${group}`);
    }
  };
  const handleRemoveGroup = async () => {
    Alert.alert("Remover", `Deseja remover o grupo ${group}?`, [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => groupRemove() },
    ]);
  };

  useEffect(() => {
    fetchPlayersByTeam();
  }, [selectedTeam]);

  return (
    <Container>
      <Header showBackButton />
      <HighLight
        title={group}
        subtitle="Adicione participantes e separe os times"
      />

      <Form>
        <Input
          placeholder="Nome do participante"
          autoCorrect={false}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          inputRef={newPlayerNameInputRef}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />
        <ButtonIcon icon="add" onPress={() => handleAddPlayer()} />
      </Form>
      <HeaderList>
        <FlatList
          data={["Time A", "Time B"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === selectedTeam}
              onPress={() => setSelectedTeam(item)}
            />
          )}
          horizontal
        />
        <AmountPlayers>{players?.length}</AmountPlayers>
      </HeaderList>
      {isLoading && <Loading />}
      {!isLoading && (
        <FlatList
          data={players}
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PlayerCard
              name={item.name}
              onRemove={() => handleRemovePlayer(item.name)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmpty message="Não há pessoas neste time" />
          )}
          contentContainerStyle={[
            { paddingBottom: 100 },
            players.length === 0 && { flex: 1 },
          ]}
        />
      )}
      <Button
        title="Remover turma"
        type="SECONDARY"
        onPress={handleRemoveGroup}
      />
    </Container>
  );
}
