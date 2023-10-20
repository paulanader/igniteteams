import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError } from "@utils/AppError";
import { PlayerStorageDTO } from "./PlayerStorageDTO";
import { PLAYER_COLLECTION } from "@storage/storage.config";
import { groupCreate } from "@storage/group/groupCreate";
import { playersGetGroup } from "./playersGetGroup";

export async function playerAddByGroup(
  newPlayer: PlayerStorageDTO,
  group: string
) {
  console.log("Aqui");
  try {
    const storagedPlayers = await playersGetGroup(group);

    const playerAlreadyExist = storagedPlayers.filter(
      (player) => player.name === newPlayer.name
    );

    console.log({ newPlayer, group, playerAlreadyExist });

    if (playerAlreadyExist.length > 0) {
      throw new AppError("Essa pessoa já está adicionada em um time");
    }

    const storage = JSON.stringify([...storagedPlayers, newPlayer]);

    await AsyncStorage.setItem(`${PLAYER_COLLECTION}-${group}`, storage);
  } catch (error) {
    throw error;
  }
}
