#/usr/bin/sed -f

# Convert CSV file with three columns to an array of the first column only.

s/\([a-z]\+\),.\+,.*$/"\1",/
1 s/^/{"bl":[/
$ s/,$/]}/
