export interface OrderableItem<TId> {
  _id: TId;
  order: number;
}

export async function swapOrder<TId>(
  items: OrderableItem<TId>[],
  index: number,
  direction: "up" | "down",
  updateMutation: (args: { id: TId; order: number }) => Promise<unknown>,
) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  const current = items[index];
  const target = items[targetIndex];
  await Promise.all([
    updateMutation({ id: current._id, order: target.order }),
    updateMutation({ id: target._id, order: current.order }),
  ]);
}