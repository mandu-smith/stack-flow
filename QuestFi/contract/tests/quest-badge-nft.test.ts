import { describe, expect, it} from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Quest Badge NFT Contract", () => {

  describe("Initialization", () => {
    it("initializes with 5 default protocols", () => {
      const protocols = ["zest", "stackingdao", "granite", "hermetica", "arkadiko"];

      protocols.forEach(protocol => {
        const { result } = simnet.callReadOnlyFn(
          "quest-badge-nft",
          "get-protocol-info",
          [Cl.stringAscii(protocol)],
          wallet1
        );

        expect(result).toBeOk(
          Cl.some(
            Cl.tuple({
              active: Cl.bool(true),
              "xp-reward": Cl.uint(protocol === "granite" ? 70 :
                                   protocol === "hermetica" ? 65 :
                                   protocol === "stackingdao" ? 60 :
                                   protocol === "arkadiko" ? 55 : 50)
            })
          )
        );
      });
    });

    it("starts with last-token-id at 0", () => {
      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-last-token-id",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("initializes with correct protocol badge counts", () => {
      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-protocol-badge-count",
        [Cl.stringAscii("zest")],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });