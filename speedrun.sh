#!/bin/bash
# 🔧 2026-06-09 修正: 無言で失敗する問題 / co-authorメール形式 / delete_repo権限 / ブランチ名依存 を修正
set -eo pipefail

# 🔧 以前は set -e + 全出力抑制(2>&1)でどこか1つコケると原因不明のまま停止していた。
#    どの行で失敗したか表示する。各コマンドも stderr は隠さない(> /dev/null のみ)。
trap 'echo ""; echo "❌ 処理が失敗しました (line $LINENO)。上のエラーメッセージを確認してください。"' ERR

# GitHub Achievements Speedrun
# Get 4 achievements in minutes

echo "🏃 GitHub Achievements Speedrun"
echo "================================"
echo ""

# Check gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install: https://cli.github.com/"
    exit 1
fi

# Check auth
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated. Run: gh auth login"
    exit 1
fi

# 🔧 後片付けの gh repo delete には delete_repo スコープが必要。通常の gh auth login では付かないので先に警告。
if ! gh auth status 2>&1 | grep -q "delete_repo"; then
    echo "⚠️  'delete_repo' スコープが見つかりません（最後の後片付けに必要）。"
    echo "    付与する場合: gh auth refresh -h github.com -s delete_repo"
    echo ""
fi

USERNAME=$(gh api user -q .login)
echo "👤 Logged in as: $USERNAME"
echo ""

# Create temp repo
REPO="achievements-speedrun-$(date +%s)"
echo "📦 Creating temporary repo: $REPO"
gh repo create "$REPO" --public > /dev/null

cd /tmp
rm -rf "$REPO"
git clone "https://github.com/$USERNAME/$REPO" > /dev/null 2>&1
cd "$REPO"

# Initialize
# 🔧 空リポジトリ clone 時のローカルブランチ名(main/master)に依存しないよう main に固定。
#    これをしないと後段の `git checkout main` が master 既定環境で失敗していた。
echo "# Speedrun" > README.md
git add .
git commit -m "init" > /dev/null
git branch -M main
git push -u origin main > /dev/null

# ⚡ Quickdraw
echo ""
echo "⚡ Getting Quickdraw..."
gh issue create -t "Quickdraw test" -b "Closing quickly" > /dev/null
gh issue close 1 > /dev/null
echo "   ✅ Quickdraw - Issue opened and closed"

# 🦈 Pull Shark (2 PRs)
echo ""
echo "🦈 Getting Pull Shark..."

git checkout -b pr1
echo "PR1" >> README.md
git add . && git commit -m "PR 1" > /dev/null
git push -u origin pr1 > /dev/null
gh pr create -t "PR 1" -b "First PR" > /dev/null
gh pr merge --merge > /dev/null
echo "   ✅ PR 1 merged"

git checkout main && git pull > /dev/null
git checkout -b pr2
echo "PR2" >> README.md
git add . && git commit -m "PR 2" > /dev/null
git push -u origin pr2 > /dev/null
gh pr create -t "PR 2" -b "Second PR" > /dev/null
gh pr merge --merge > /dev/null
echo "   ✅ PR 2 merged"
echo "   ✅ Pull Shark unlocked!"

# 🤠 YOLO
echo ""
echo "🤠 Getting YOLO..."
git checkout main && git pull > /dev/null
git checkout -b yolo
echo "YOLO" >> README.md
git add . && git commit -m "YOLO commit" > /dev/null
git push -u origin yolo > /dev/null
gh pr create -t "YOLO" -b "No review needed" > /dev/null
gh pr merge --merge > /dev/null
echo "   ✅ YOLO - PR merged without review"

# 👥 Pair Extraordinaire
echo ""
echo "👥 Getting Pair Extraordinaire..."
git checkout main && git pull > /dev/null
git checkout -b pair
echo "Pair" >> README.md
git add .
# 🔧 co-author は「自分とは別の実在ユーザー」かつ正しい noreply 形式(数字ID付き)でないと付与されない。
#    旧形式 TakatoPhy@users.noreply.github.com は2017年8月以降作成アカウントに紐付かず無効だった。
git commit -m "feat: pair programming

Co-Authored-By: TakatoPhy <128906527+TakatoPhy@users.noreply.github.com>" > /dev/null
git push -u origin pair > /dev/null
gh pr create -t "Pair PR" -b "Co-authored commit" > /dev/null
gh pr merge --merge > /dev/null
echo "   ✅ Pair Extraordinaire - Co-authored PR merged"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
cd ~
# 🔧 削除失敗(delete_repo権限不足など)で set -e により全体を落とさない。手動手順を案内する。
if gh repo delete "$USERNAME/$REPO" --yes > /dev/null 2>&1; then
    echo "   ✅ Removed temporary repo"
else
    echo "   ⚠️  一時リポジトリの自動削除に失敗（delete_repo 権限が無い可能性）。"
    echo "       手動削除: gh auth refresh -h github.com -s delete_repo && gh repo delete $USERNAME/$REPO --yes"
fi
rm -rf "/tmp/$REPO"

echo ""
echo "================================"
echo "🎉 Done! Check your profile:"
echo "   https://github.com/$USERNAME?tab=achievements"
echo ""
echo "Note: Achievements may take a few minutes to appear."
