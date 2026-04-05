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

  describe("Badge Minting", () => {
    it("allows user to mint badge for valid protocol", () => {
      const { result } = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments last-token-id after minting", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-last-token-id",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("stores badge info correctly", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-badge-info",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(
        Cl.some(
          Cl.tuple({
            protocol: Cl.stringAscii("zest"),
            owner: Cl.principal(wallet1),
            "completion-date": Cl.uint(simnet.blockHeight),
            "xp-earned": Cl.uint(50)
          })
        )
      );
    });

    it("increments protocol badge count", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("stackingdao")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-protocol-badge-count",
        [Cl.stringAscii("stackingdao")],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("allows different users to mint same protocol badge", () => {
      const mint1 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("granite")],
        wallet1
      );
      expect(mint1.result).toBeOk(Cl.uint(1));

      const mint2 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("granite")],
        wallet2
      );
      expect(mint2.result).toBeOk(Cl.uint(2));
    });

    it("allows user to mint badges for different protocols", () => {
      const mint1 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );
      expect(mint1.result).toBeOk(Cl.uint(1));

      const mint2 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("arkadiko")],
        wallet1
      );
      expect(mint2.result).toBeOk(Cl.uint(2));
    });
  });

  describe("Duplicate Prevention", () => {
    it("prevents user from minting same protocol badge twice", () => {
      // First mint succeeds
      const mint1 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("hermetica")],
        wallet1
      );
      expect(mint1.result).toBeOk(Cl.uint(1));

      // Second mint fails with ERR_ALREADY_CLAIMED
      const mint2 = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("hermetica")],
        wallet1
      );
      expect(mint2.result).toBeErr(Cl.uint(104)); // ERR_ALREADY_CLAIMED
    });

    it("tracks user-protocol badge mapping", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-user-badge",
        [Cl.principal(wallet1), Cl.stringAscii("zest")],
        wallet1
      );

      expect(result).toBeOk(Cl.some(Cl.uint(1)));
    });

    it("returns none for non-existent user-protocol badge", () => {
      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-user-badge",
        [Cl.principal(wallet1), Cl.stringAscii("zest")],
        wallet1
      );

      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Invalid Protocol Handling", () => {
    it("rejects minting for non-existent protocol", () => {
      const { result } = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("invalid-protocol")],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_INVALID_QUEST
    });

    it("rejects minting for inactive protocol", () => {
      // First deactivate a protocol
      simnet.callPublicFn(
        "quest-badge-nft",
        "set-protocol",
        [Cl.stringAscii("zest"), Cl.bool(false), Cl.uint(50)],
        deployer
      );

      // Try to mint
      const { result } = simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("zest")],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_INVALID_QUEST
    });
  });

  describe("NFT Ownership", () => {
    it("correctly assigns NFT ownership", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("stackingdao")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-owner",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });

    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        "quest-badge-nft",
        "get-owner",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Soul-Bound Transfer Prevention", () => {
    it("prevents transfer of badges (soul-bound)", () => {
      // Mint badge first
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("granite")],
        wallet1
      );

      // Try to transfer
      const { result } = simnet.callPublicFn(
        "quest-badge-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR_UNAUTHORIZED
    });

    it("prevents transfer even by contract owner", () => {
      simnet.callPublicFn(
        "quest-badge-nft",
        "mint-badge",
        [Cl.stringAscii("arkadiko")],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        "quest-badge-nft",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR_UNAUTHORIZED
    });
  });