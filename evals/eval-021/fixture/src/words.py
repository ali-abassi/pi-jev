def load(path):
    with open(path) as f:
        return f.read().split("\n")
def main():
    words = [w for w in load("src/words.txt") if w]
    assert words == ["alpha", "beta", "gamma"], words
    print("ok")
if __name__ == "__main__":
    main()
