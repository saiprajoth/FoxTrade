import { prisma } from "@repo/db";

export async function getUserPortfolio(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      balances: {
        orderBy: {
          asset: {
            symbol: "asc"
          }
        },
        select: {
          availableQuantity: true,
          reservedQuantity: true,
          asset: {
            select: {
              id: true,
              symbol: true,
              name: true,
              type: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    balances: user.balances.map((balance) => {
      const totalQuantity = balance.availableQuantity.plus(
        balance.reservedQuantity
      );

      return {
        asset: balance.asset,
        availableQuantity: balance.availableQuantity.toString(),
        reservedQuantity: balance.reservedQuantity.toString(),
        totalQuantity: totalQuantity.toString()
      };
    })
  };
}