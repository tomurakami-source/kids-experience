#!/bin/bash
# 第1引数に渡されたファイルをClaudeに解説させるスクリプト
claude -p "以下のコードを日本語で簡潔に解説してください。: $(cat $1)" --model haiku


